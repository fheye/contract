import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EIP712DomainChanged,
  FaceDetected,
  ImageUploaded,
  MetadataAccessed
} from "../generated/FaceDetection/FaceDetection"

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createFaceDetectedEvent(
  user: Address,
  imageId: BigInt,
  distance: BigInt
): FaceDetected {
  let faceDetectedEvent = changetype<FaceDetected>(newMockEvent())

  faceDetectedEvent.parameters = new Array()

  faceDetectedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  faceDetectedEvent.parameters.push(
    new ethereum.EventParam(
      "imageId",
      ethereum.Value.fromUnsignedBigInt(imageId)
    )
  )
  faceDetectedEvent.parameters.push(
    new ethereum.EventParam(
      "distance",
      ethereum.Value.fromUnsignedBigInt(distance)
    )
  )

  return faceDetectedEvent
}

export function createImageUploadedEvent(
  user: Address,
  imageId: BigInt
): ImageUploaded {
  let imageUploadedEvent = changetype<ImageUploaded>(newMockEvent())

  imageUploadedEvent.parameters = new Array()

  imageUploadedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  imageUploadedEvent.parameters.push(
    new ethereum.EventParam(
      "imageId",
      ethereum.Value.fromUnsignedBigInt(imageId)
    )
  )

  return imageUploadedEvent
}

export function createMetadataAccessedEvent(
  imageId: BigInt,
  accessor: Address,
  fee: BigInt,
  locationX: BigInt,
  locationY: BigInt,
  timestamp: BigInt
): MetadataAccessed {
  let metadataAccessedEvent = changetype<MetadataAccessed>(newMockEvent())

  metadataAccessedEvent.parameters = new Array()

  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam(
      "imageId",
      ethereum.Value.fromUnsignedBigInt(imageId)
    )
  )
  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam("accessor", ethereum.Value.fromAddress(accessor))
  )
  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )
  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam(
      "locationX",
      ethereum.Value.fromUnsignedBigInt(locationX)
    )
  )
  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam(
      "locationY",
      ethereum.Value.fromUnsignedBigInt(locationY)
    )
  )
  metadataAccessedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return metadataAccessedEvent
}
