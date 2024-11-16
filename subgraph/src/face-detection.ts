import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  EIP712DomainChanged as EIP712DomainChangedEvent,
  FaceDetected as FaceDetectedEvent,
  ImageUploaded as ImageUploadedEvent,
  MetadataAccessed as MetadataAccessedEvent
} from "../generated/FaceDetection/FaceDetection";
import {
  User,
  Image,
  FaceDetectionEvent as FaceDetectionEventEntity,
  MetadataAccessEvent
} from "../generated/schema";

function getOrCreateUser(address: Bytes): User {
  let user = User.load(address);

  if (user == null) {
    user = new User(address);
    user.locationX = 0;
    user.locationY = 0;
    user.alertDistance = BigInt.fromI32(0);
    user.rewards = BigInt.fromI32(0);
    user.queryCount = 0;
    user.uploadedImagesCount = 0;
    user.save();
  }

  return user;
}

export function handleFaceDetected(event: FaceDetectedEvent): void {
  let imageId = event.params.imageId.toString();
  let image = Image.load(imageId);

  if (image == null) {
    return;
  }

  let user = getOrCreateUser(event.params.user);

  user.queryCount = user.queryCount + 1;
  image.detectionCount = image.detectionCount + 1;

  let detectionEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let detectionEvent = new FaceDetectionEventEntity(detectionEventId);
  detectionEvent.user = user.id;
  detectionEvent.image = image.id;
  detectionEvent.distance = event.params.distance;
  detectionEvent.timestamp = event.block.timestamp;

  detectionEvent.save();
  user.save();
  image.save();
}

export function handleImageUploaded(event: ImageUploadedEvent): void {
  let imageId = event.params.imageId.toString();
  let image = new Image(imageId);

  let uploader = getOrCreateUser(event.params.user);

  image.locationX = BigInt.fromI32(0);
  image.locationY = BigInt.fromI32(0);
  image.timestamp = BigInt.fromI32(0);
  image.uploader = uploader.id;
  image.detectionCount = 0;
  image.accessCount = 0;
  image.isRevealed = false;
  image.uploader = uploader.id;

  uploader.uploadedImagesCount = uploader.uploadedImagesCount + 1;
;
  image.save();
  uploader.save();
}

export function handleMetadataAccessed(event: MetadataAccessedEvent): void {
  let imageId = event.params.imageId.toString();
  let image = Image.load(imageId);

  if (image == null) {
    return;
  }

  let accessor = getOrCreateUser(event.transaction.from);

  image.locationX = event.params.locationX;
  image.locationY = event.params.locationY;
  image.timestamp = event.params.timestamp;
  image.isRevealed = true;
  image.accessCount = image.accessCount + 1;

  let uploader = getOrCreateUser(image.uploader);
  uploader.rewards = uploader.rewards.plus(event.transaction.gasPrice);

  let accessEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let accessEvent = new MetadataAccessEvent(accessEventId);
  accessEvent.image = image.id;
  accessEvent.accessor = accessor.id;
  accessEvent.fee = event.transaction.gasPrice;
  accessEvent.locationX = image.locationX;
  accessEvent.locationY = image.locationY;
  accessEvent.timestamp = event.block.timestamp;

  accessEvent.save();
  image.save();
  accessor.save();
  uploader.save();
}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}