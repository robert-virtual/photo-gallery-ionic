import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera"
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';


export interface UserPhoto {
  filePath: string
  webviewPath?: string
}



@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public PHOTO_STORAGE: string = "PHOTOS"
  public photos: UserPhoto[] = []
  constructor() {
  }
  public async loadImages() {

    const result = await Preferences.get({ key: this.PHOTO_STORAGE })
    this.photos = JSON.parse(result.value ?? "[]")
    for (let i = 0; i < this.photos.length; i++) {
       const photo = this.photos[i]
       const file = await Filesystem.readFile({
        path:photo.filePath,
        directory:Directory.Data
       }) 
       this.photos[i].webviewPath = `data:image/jpeg;base64,${file.data}`
    }

  }
  public async addToGallery() {
    const capturePhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100
    })
    const savedImageFile = await this.savePicture(capturePhoto)
    this.photos.unshift(savedImageFile)
    await Preferences.set({key:this.PHOTO_STORAGE,value:JSON.stringify(this.photos)})

  }
  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const fileName = Date.now() + '.jpeg'
    const base64 = photo.base64String
    if (!base64) {
      console.log("no valid base64");
      return {
        filePath: "no valid base64",
        webviewPath: photo.webPath
      }
    }
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Data
    })
    return {
      filePath:fileName,
      webviewPath: `data:image/jpeg;base64,${base64}`
    }
  }
}
