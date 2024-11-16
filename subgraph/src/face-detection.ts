import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  EIP712DomainChanged as EIP712DomainChangedEvent,
  FaceDetected as FaceDetectedEvent,
  ImageUploaded as ImageUploadedEvent,
  MetadataAccessed as MetadataAccessedEvent
} from "../generated/FaceDetection/FaceDetection"
import {
  User,
  Image
} from "../generated/schema"

function getOrCreateUser(address: Bytes): User {
  let user = User.load(address);

  if (user == null) {
    user = new User(address);
    user.locationX = 0;
    user.locationY = 0;
    user.rewards = BigInt.fromI32(0);
    user.queryCount = 0;
    user.save();
  }

  return user as User;
}

export function handleFaceDetected(event: FaceDetectedEvent): void {
  let imageId = event.params.imageId.toString();
  let image = Image.load(imageId) as Image;
  let user = getOrCreateUser(event.params.user);

  user.queryCount += 1;
  image.detectionCount += 1;
  
  user.save();
  image.save();
}

export function handleImageUploaded(event: ImageUploadedEvent): void {
  let image = new Image(event.params.imageId.toString()) as Image;
  let user = getOrCreateUser(event.params.user);

  image.locationX = BigInt.fromI32(0);
  image.locationY = BigInt.fromI32(0);
  image.timestamp = BigInt.fromI32(0);
  image.detectionCount = 0;
  image.isRevealed = false;
  image.user = user.id;

  image.save();
  user.save()
}

export function handleMetadataAccessed(event: MetadataAccessedEvent): void {
  let image = Image.load(event.params.imageId.toString()) as Image;
  
  image.locationX = event.params.locationX;
  image.locationY = event.params.locationY;
  image.timestamp = event.params.timestamp;
  image.isRevealed = true;

  let user = getOrCreateUser(image.user);
  user.rewards = user.rewards.plus(event.transaction.gasPrice);
  user.save();

  image.save();
}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}