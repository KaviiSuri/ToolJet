import React from 'react';

export function useOthers(socket) {
  const [users, setUsers] = React.useState({});

  React.useEffect(() => {
    socket?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.message === 'updatePresense') {
        try {
          // throttled(_users);
          setUsers((users) => {
            const _users = { ...users };
            _users[data.clientId] = data.meta;
            return _users;
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  }, [socket]);

  return users;
}
