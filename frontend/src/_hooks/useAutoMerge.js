import React from 'react';
import Automerge from 'automerge';

window.doc = Automerge.init();

export function useAutomerge(initialDoc, socket, appId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const updateDoc = React.useCallback(
    (updater, message) => {
      try {
        console.log('-----start diff calculation----- ');
        setTimeout(function () {
          window.newDoc = Automerge.change(window.doc, message, updater);
          const changes = Automerge.getChanges(window.doc, window.newDoc);
          window.doc = window.newDoc;
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
        }, 1000);
      } catch (error) {
        console.log('automerge-error', error);
        // TODO: send to sentry
      }
    },
    [appId, currentUser.id, socket]
  );

  const mergeDoc = React.useCallback(
    (updatedDoc) => {
      console.log(updatedDoc);
      window.doc = Automerge.applyChanges(window.doc, updatedDoc);
      return window.doc;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [window.doc]
  );

  return [updateDoc, mergeDoc];
}
