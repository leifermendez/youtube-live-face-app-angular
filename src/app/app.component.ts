import {Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {VideoPlayerService} from './video-player.service';
import {FaceApiService} from './face-api.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public currentStream: any;
  public dimensionVideo: any;
  listEvents: Array<any> = [];
  overCanvas: any;
  listExpressions: any = [];

  constructor(
    private faceApiService: FaceApiService,
    private videoPlayerService: VideoPlayerService,
    private renderer2: Renderer2,
    private elementRef: ElementRef
  ) {


  }


  ngOnInit(): void {
    this.listenerEvents();
    this.checkMediaSource();
    this.getSizeCam();
  }

  ngOnDestroy(): void {
    this.listEvents.forEach(event => event.unsubscribe());
  }

  listenerEvents = () => {
    const observer1$ = this.videoPlayerService.cbAi
      .subscribe(({resizedDetections, displaySize, expressions, videoElement}) => {
        resizedDetections = resizedDetections[0] || null;
        // :TODO Aqui pintamos! dibujamos!
        if (resizedDetections) {
          this.listExpressions = _.map(expressions, (value, name) => {
            return {name, value};
          });
          this.createCanvasPreview(videoElement);
          this.drawFace(resizedDetections, displaySize);
        }
      });

    this.listEvents = [observer1$];
  };

  drawFace = (resizedDetections, displaySize) => {
    if (this.overCanvas) {
      const {globalFace} = this.faceApiService;
      this.overCanvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
      globalFace.draw.drawFaceLandmarks(this.overCanvas, resizedDetections);
    }
  };

  checkMediaSource = () => {
    if (navigator && navigator.mediaDevices) {

      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      }).then(stream => {
        this.currentStream = stream;
      }).catch(() => {
        console.log('**** ERROR NOT PERMISSIONS *****');
      });

    } else {
      console.log('******* ERROR NOT FOUND MEDIA DEVICES');
    }
  };

  getSizeCam = () => {
    const elementCam: HTMLElement = document.querySelector('.cam');
    const {width, height} = elementCam.getBoundingClientRect();
    this.dimensionVideo = {width, height};
  };

  createCanvasPreview = (videoElement: any) => {
    if (!this.overCanvas) {
      const {globalFace} = this.faceApiService;
      this.overCanvas = globalFace.createCanvasFromMedia(videoElement.nativeElement);
      this.renderer2.setProperty(this.overCanvas, 'id', 'new-canvas-preview');
      const elementPreview = document.querySelector('.canvas-preview');
      this.renderer2.appendChild(elementPreview, this.overCanvas);
    }
  };

}
