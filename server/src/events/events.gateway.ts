import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { AuthService } from 'src/services/auth.service';
import { isEmpty } from 'lodash';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private authService: AuthService) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: any): void {}

  handleDisconnect(client: any): void {}

  broadcast(data: any) {
    switch (data.message) {
      case 'appDefinitionChanged':
      case 'updatePresense':
        this.server.clients.forEach((client: any) => {
          if (client.isAuthenticated && client.appId === data.appId && client.id !== data.clientId)
            client.send(JSON.stringify(data));
        });
        break;

      default:
        this.server.clients.forEach((client: any) => {
          if (client.isAuthenticated && client.appId === data.appId) client.send(data.message);
        });
        break;
    }
  }

  @SubscribeMessage('authenticate')
  onAuthenticateEvent(client: any, data: string) {
    const signedJwt = this.authService.verifyToken(data);
    if (isEmpty(signedJwt)) client._events.close();
    else client.isAuthenticated = true;
    return;
  }

  @SubscribeMessage('subscribe')
  onSubscribeEvent(client: any, data: string) {
    const _data = JSON.parse(data);
    client.appId = _data.appId;
    client.id = _data.clientId;
    client.meta = _data.meta;
    _data.message = 'updatePresense';
    this.broadcast(_data);
    return;
  }

  @SubscribeMessage('updatePresense')
  onUpdatePresenseEvent(_: any, data: string) {
    const _data = JSON.parse(data);
    this.broadcast(_data);
    return;
  }

  @SubscribeMessage('appDefinitionChanged')
  onAppDefinitionChangedEvent(_: any, data: string) {
    const _data = JSON.parse(data);
    this.broadcast(_data);
    return;
  }

  @SubscribeMessage('events')
  onEvent(@MessageBody() data: any) {
    this.broadcast(data);
    return data.message;
  }
}
