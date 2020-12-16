import React, { useEffect } from "react";
import * as faceapi from "face-api.js";

import "./app.scss";

function App() {
  const runModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    streamCamVideo();
  };

  const streamCamVideo = async () => {
    var constraints = { audio: false, video: { width: 1280, height: 720 } };
    try {
      let MediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      let video = document.querySelector("video");
      video.srcObject = MediaStream;
      video.onloadedmetadata = (e) => {
        video.play().then(findFace());
      };
    } catch (e) {
      console.log(e.name + ": " + e.message);
    }
  };

  const findFace = () => {
    const video = document.getElementById("video");
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    // const displaySize = { width: video.width, height: video.height };
    const displaySize = { width: canvas.width, height: canvas.height };

    setInterval(async () => {
      const detection = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        // .withFaceExpressions()
        .withFaceLandmarks();

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      const resizedDetection = faceapi.resizeResults(detection, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetection);
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetection);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    }, 100);
  };

  useEffect(() => {
    runModels();
  }, []);

  return (
    <div>
      <video autoPlay id="video" />
    </div>
  );
}

export default App;
