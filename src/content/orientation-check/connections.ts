export const connections = [
  { id: 'first', from: 'seed', to: 'thread', unlockStep: 1 },
  { id: 'eastward', from: 'thread', to: 'east', unlockStep: 2 },
  { id: 'westward', from: 'thread', to: 'west', unlockStep: 2 },
  { id: 'east-return', from: 'east', to: 'gather', unlockStep: 3 },
  { id: 'west-return', from: 'west', to: 'gather', unlockStep: 3 },
];
