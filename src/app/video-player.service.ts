import {EventEmitter, Injectable} from '@angular/core';
import {FaceApiService} from './face-api.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  cbAi: EventEmitter<any> = new EventEmitter<any>();

  constructor(private faceApiService: FaceApiService) {

  }

  getLandMark = async (videoElement: any) => {
    const {globalFace} = this.faceApiService;
    const {videoWidth, videoHeight} = videoElement.nativeElement;
    const displaySize = {width: videoWidth, height: videoHeight};
    // console.log(displaySize);
    const detectionsFaces = await globalFace.detectAllFaces(videoElement.nativeElement)
      .withFaceLandmarks()
      .withFaceExpressions();


    // console.log(detectionsFaces);
    const landmark = detectionsFaces[0].landmarks || null;
    const expressions = detectionsFaces[0].expressions || null;
    const eyeLeft = landmark.getLeftEye();
    const eyeRight = landmark.getRightEye();
    const eyes = {
      left: [_.head(eyeLeft), _.last(eyeLeft)],
      right: [_.head(eyeRight), _.last(eyeRight)],
    };
    const resizedDetections = globalFace.resizeResults(detectionsFaces, displaySize);
    this.cbAi.emit({
      resizedDetections,
      displaySize,
      expressions,
      eyes,
      videoElement
    });

  };
}
