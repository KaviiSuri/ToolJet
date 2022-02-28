import React from 'react';
import { Editor } from '@/Editor';
import { Cursor } from '@/Editor/Cursor';
import { useAutomerge } from '@/_hooks/useAutoMerge';
import { useSelf } from '@/_hooks/useSelf';
import { useOthers } from '@/_hooks/useOthers';
import { createWebsocketConnection } from '@/_helpers/websocketConnection';

const MultiplayerEditor = (props) => {
  const { socket } = React.useMemo(() => createWebsocketConnection(props.match.params.id), [props.match.params.id]);

  const updatePresence = useSelf(socket, props.match.params.id);

  const others = useOthers(socket, props.match.params.id);

  const handlePointerMove = React.useCallback(
    (e) => {
      const element = document.getElementById('real-canvas');
      if (element?.parentNode?.matches(':hover')) {
        updatePresence({
          x: e.pageX / document.documentElement.clientWidth,
          y: e.pageY / document.documentElement.clientHeight,
        });
      }
    },
    [updatePresence]
  );

  const [updateDoc, mergeDoc] = useAutomerge({}, socket, props.match.params.id);

  React.useEffect(() => {
    () => socket && socket?.close();
  }, [socket]);

  return (
    <div onPointerMove={handlePointerMove}>
      <Editor {...props} updateDoc={updateDoc} mergeDoc={mergeDoc} socket={socket} />
      {Object.keys(others).map((key) => {
        return (
          <Cursor
            key={key}
            color={others[key].color}
            x={others[key].x * document.documentElement.clientWidth}
            y={others[key].y * document.documentElement.clientHeight}
          />
        );
      })}
    </div>
  );
};

export { MultiplayerEditor };
