import React from 'react';
import Automerge from 'automerge';

export function useAutomerge(initialDoc, socket, appId) {
  const [doc, setDoc] = React.useState(() =>
    Automerge.from(typeof initialDoc === 'function' ? initialDoc() : initialDoc)
  );

  const updateDoc = React.useCallback((updater, message) => {
    try {
      console.log('-----start diff calculation----- ');
      const newDoc = Automerge.change(doc, message, updater);
      const changes = Automerge.getChanges(doc, newDoc);
      console.log('-----stop diff calculation-----');

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
  }, []);

  const mergeDoc = React.useCallback(
    (updatedDoc) => {
      let [newDoc] = Automerge.applyChanges(doc, updatedDoc);
      setDoc(newDoc);
      return newDoc;
    },
    [doc]
  );

  return [updateDoc, mergeDoc];
}
