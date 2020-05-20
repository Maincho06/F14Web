import { Component } from '@angular/core';
import { NgxAgoraService, AgoraClient, ClientEvent, Stream, StreamEvent } from 'ngx-agora';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'F14';
  localCallId = 'agora_local';
  remoteCalls: string[] = [];

  private client: AgoraClient;
  private localStream: Stream;
  private uid: number;

  constructor(private ngxAgoraService: NgxAgoraService) {
    this.uid = Math.floor(Math.random() * 100);
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit(): void {
    this.client = this.ngxAgoraService.createClient({
      mode: 'rtc',
      codec: 'h264'
    });
    this.assignClientHandlers();
    // Inicializamos la tramision A/V local
    this.localStream = this.ngxAgoraService.createStream({streamID: this.uid, audio: true, video: true, screen: false});
    this.assignLocalStreamHandlers();
    this.initLocalStream();

    // Unete y publica metodos agregados en este paso
    this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
  }

  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, ()  => {
      console.log('accessAllower');
    });
    // Si el usuario denego los permisos de la camara y microfono
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('Acceso denegado');
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        // El usuario otorgó acceso a la camara y microfono
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.log('getUserMedia failed', err)
    );
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          'e1cb9ad27e5144238e1e4815b5d6ec1b',
          () => console.log('Renewed the channel key successfully.'),
          renewError => console.log('Renew channel hey failed:', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

  }

  /**
   * Intenta conectars a una sala de chat en linea donde los usuarios puede alojar y recibir transmisiones A / V;
   */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.client.join(null, 'foo-bar', this.uid, onSuccess, onFailure);
  }

  /**
   * Intenta cargar las trasmisiones A / V local creada en una sala de chat 
   */
  publish(): void {
    this.client.publish(this.localStream, err => console.log('Publish local stream error: ' + err));
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }
}
