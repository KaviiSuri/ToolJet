import React from 'react';
import Automerge from 'automerge';

export function useAutomerge(initialDoc, socket, appId) {
  const [doc, setDoc] = React.useState(() =>
    Automerge.from(typeof initialDoc === 'function' ? initialDoc() : initialDoc)
  );

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const updateDoc = React.useCallback((updater, message) => {
    try {
      console.log('-----start diff calculation----- ');
      const newDoc = Automerge.change(doc, message, updater);
      const changes = Automerge.getChanges(doc, newDoc);
      console.log('-----stop diff calculation-----');

      const socketData = {
        clientId: currentUser.id,
        data: changes,
        appId,
        message: 'appDefinitionChanged',
      };

      socket.send(
        JSON.stringify({
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
      let newDoc = Automerge.applyChanges(doc, updatedDoc);
      console.log(newDoc)
      setDoc(newDoc);
      return newDoc;
    },
    [doc]
  );

  return [updateDoc, mergeDoc];
}
