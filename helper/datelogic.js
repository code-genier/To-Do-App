module.exports = () => {
  var object = {
    month: "long",
    year: "numeric",
    day: "numeric",
  };

  const today = new Date().toLocaleString("en-us", object);
  return today;
};
