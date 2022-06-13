import React, { useEffect, useRef } from 'react';
import {EditorView, keymap, lineNumbers, highlightActiveLine, ViewPlugin, ViewUpdate, Tooltip, showTooltip } from "@codemirror/view"
import {EditorState, ChangeSet, Text, StateField, StateEffect, StateEffectType } from "@codemirror/state"
import {indentWithTab, defaultKeymap} from '@codemirror/commands';
import {bracketMatching} from '@codemirror/language';
import {closeBrackets} from '@codemirror/autocomplete';
// import { vim } from '@replit/codemirror-vim';
import interact from '@replit/codemirror-interact';
import { collab, getSyncedVersion, receiveUpdates, sendableUpdates, Update } from '@codemirror/collab';
import uniqBy from 'lodash/uniqBy';


const updateCursor = StateEffect.define({
  map({user, pos}, changes) {
    pos = changes.mapPos(pos, 1)
    return {user, pos};
  }
});

function peerExtension(startRev, socket) {
  let plugin = ViewPlugin.fromClass(class {
    private pushing = false;
    private done = false;

    constructor(private view: EditorView) { 
      socket.on('pushUpdatesRes', (a) => this.receiveUpdateAck(a));
      socket.on('pullUpdatesRes', (b) => this.dispatchUpdates(b));
      setTimeout(() => this.pull(), 1000);
    }

    update(update: ViewUpdate) {
      const updateContainsEffects = update.transactions[0]?.effects?.length;
      if (update.docChanged || updateContainsEffects) this.push();
    }

    async push() {
      let updates = sendableUpdates(this.view.state);
      if (this.pushing || !updates.length) return;
      this.pushing = true;
      let rev = getSyncedVersion(this.view.state);

      updates = updates.map(u => {
        return ({
          clientID: u.clientID,
          changes: u.changes.toJSON(),
          effects: u.effects ? JSON.stringify(u.effects) : '',
        })
      });
      socket.emit('pushUpdates', {rev, updates});
    }

    async receiveUpdateAck(didSucceed) {
      this.pushing = false;
      if (sendableUpdates(this.view.state).length) {
        setTimeout(() => this.push(), 100);
      }
    }

    async pull() {
      let rev = getSyncedVersion(this.view.state);
      socket.emit('pullUpdates', {rev});
    }

    async dispatchUpdates(updates) {
      updates = updates.map(u => {
        const effects = JSON.parse(u.effects).map(e => updateCursor.of({user: e.value.user, pos: e.value.pos}));
        const changes = ChangeSet.fromJSON(u.changes);
        const update = {
          changes,
          effects,
          clientID: u.clientID
        };

        return update;
      });
      this.view.dispatch(receiveUpdates(this.view.state, updates));
      this.pull();
    }

    destroy() {
      this.done = true;
      socket.removeAllListeners('pushUpdatesRes');
      socket.removeAllListeners('pullUpdatesRes');
    }
  })
  
  return [
    collab({
      startVersion: startRev,
      sharedEffects: tr => {
        return tr.effects.filter(e => e.is(updateCursor))}
    }),
    plugin]
}

function getCursorTooltips(cursors): readonly Tooltip[] {
  return cursors.map(({user, pos}) => {
      return {
        pos,
        user,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement('div');
          dom.className = 'cm-tooltip-cursor';
          dom.textContent = user;
          return {dom}
        }
      }
    })
}

export default ({socket, username, nodeId, initialDoc, initialRev}) => {
  const entry = useRef();
  const view = useRef();

  useEffect(() => {
    if (!socket) return;
    if (initialDoc === undefined) return;
    if (!entry.current || view.current) return;

    let theme = EditorView.theme({}, {dark: true});

    let cursorTooltipField = StateField.define({
      create: () => ([]),
      update(tooltips, tr) {
        const containsEffects = tr.effects?.length;
        if (!(tr.docChanged || tr.selection || containsEffects)) return tooltips;
        const heads = tr.state.selection.ranges.map(range => {
          tr.state.update()
          return range.head;
        })


        // ---- TODO: clearly not a good way to sync cursor position, causing bugs and needs fixing ----
        tr.effects = [
          ...heads.map(h => updateCursor.of({
            user: username, 
            pos: h
          })),
          ...tr.effects, 
        ];
        tr.state.update({changes: [], effects: tr.effects});

        const cursors = tr.effects.filter(e => e.is(updateCursor)).map(e => ({user: e.value.user, pos: e.value.pos}));

        let newTooltips =  [...getCursorTooltips(cursors), ...tooltips];
        newTooltips = uniqBy(newTooltips, 'user');
        return [];
        return newTooltips;
        // ---------------------------------
      },
      provide: f => showTooltip.computeN([f], state => state.field(f))
    })

    const interactRules = {
      rules: [
          {
            regexp: /-?\b\d+\.?\d*\b/g,
            cursor: "ew-resize",
            onDrag: (text, setText, e) => {
              const newVal = Number(text) + e.movementX;
              if (isNaN(newVal)) return;
              setText(newVal.toString());
            },
          }
        ]
    }

    let startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        // vim(),
        interact(interactRules),
        keymap.of(defaultKeymap),
        keymap.of([indentWithTab]),
        lineNumbers(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        theme,
        cursorTooltipField,
        peerExtension(initialRev, socket),
      ]
    });

    view.current = new EditorView({
      state: startState,
      parent: entry.current
    });

    return () => {
      console.log('remove peer extension listeners')
      socket.removeAllListeners('pushUpdatesRes');
      socket.removeAllListeners('pullUpdatesRes');
    }
  }, [entry.current, socket, initialDoc, initialRev]);

  return (
    <div ref={entry} className='flex-grow h-full'/>
  )
}

