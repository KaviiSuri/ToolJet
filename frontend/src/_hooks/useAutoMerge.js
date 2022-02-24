import React from 'react';
import Automerge from 'automerge';
import { throttle } from 'lodash';

export function useAutomerge(initialDoc, socket, appId) {
  const [doc, setDoc] = React.useState(() =>
    Automerge.from(typeof initialDoc === 'function' ? initialDoc() : initialDoc)
  );

  const throttled = throttle((updater, message) => {
    try {
      const newDoc = Automerge.change(doc, message, updater);
      const changes = Automerge.getChanges(doc, newDoc);

      const socketData = {
        data: changes,
        message: 'appDefinitionChanged',
      };

      socket.send(
        JSON.stringify({
          appId,
          event: 'appDefinitionChanged',
          data: JSON.stringify(socketData),
        })
      );

      setDoc(newDoc);
    } catch (error) {
      console.log('automerge-error', error);
      // TODO: send to sentry
    }
  }, 4000);

  const updateDoc = React.useCallback((updater, message) => throttled(updater, message), [throttled]);

  const mergeDoc = React.useCallback(
    (updatedDoc) => {
      let [newDoc] = Automerge.applyChanges(doc, updatedDoc);
      setDoc(newDoc);
    },
    [doc]
  );

  return [doc, updateDoc, mergeDoc];
}
