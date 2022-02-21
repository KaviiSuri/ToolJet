import React from 'react';
import Automerge from 'automerge';

export function useAutomerge(initialDoc) {
  const [doc, setDoc] = React.useState(() =>
    Automerge.from(typeof initialDoc === 'function' ? initialDoc() : initialDoc)
  );
  return [
    doc,
    React.useCallback(
      (updater, message) => {
        setDoc(Automerge.change(doc, message, updater));
        return doc;
      },
      [doc]
    ),
    React.useCallback(
      (doc2) => {
        setDoc(Automerge.merge(doc, doc2));
      },
      [doc]
    ),
  ];
}
