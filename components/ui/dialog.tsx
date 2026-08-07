"use client";

import React from "react";
import { Modal, ModalProps } from "./modal";

export type DialogProps = ModalProps;

export function Dialog(props: DialogProps) {
  return <Modal {...props} />;
}
