const dateToHumanReadable = (dateToTransform: Date) => {
  return new Date(dateToTransform).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export default dateToHumanReadable;
