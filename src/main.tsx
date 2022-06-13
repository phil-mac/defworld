import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
// import { getMainDefinition } from '@apollo/client/utilities';
// import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
// import { createClient } from 'graphql-ws';

const abortController = new AbortController();

const httpLink = new HttpLink({
  uri: 'https://defworld-api.phil-mac.repl.co/graphql',
  fetchOptions: {
    signal: abortController.signal,
  },
});

// ---- remove subscriptions for now, to experiment with only using sockets.io ----
// const wsLink = new GraphQLWsLink(createClient({
//   url: 'wss://defworld-api.phil-mac.repl.co/subscriptions',
// }));
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     const isSubscription = definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription';
    
//     return isSubscription;
//   },
//   wsLink,
//   httpLink
// );

const client = new ApolloClient({
  // ---- remove subscriptions for now, to experiment with only using sockets.io ----
  // link: splitLink,
  link: httpLink,
  cache: new InMemoryCache()
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ApolloProvider client={client}>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </ApolloProvider>
)