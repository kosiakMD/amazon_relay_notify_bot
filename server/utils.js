export function serialize(array) {
  return array.join(';');
}
export function deserialize(string) {
  return string.split(';');
}
