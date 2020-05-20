import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Agora
import { NgxAgoraModule, AgoraConfig } from 'ngx-agora';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

const agoraConfig: AgoraConfig = {
  AppID: 'e1cb9ad27e5144238e1e4815b5d6ec1b',
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxAgoraModule.forRoot(agoraConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
