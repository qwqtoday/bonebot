export interface Message {
  type: MessageType;
}

export interface CommandMessage extends Message {
  type: 'command';
  command: string;
  args: string[];
}

export type MessageType = 'command';
