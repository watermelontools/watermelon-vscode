function removeLoading(errorTimeout) {
  clearTimeout(errorTimeout);
  $("#ghHolder p").remove();
  $("#ghHolder button").remove();
}
export default removeLoading;
