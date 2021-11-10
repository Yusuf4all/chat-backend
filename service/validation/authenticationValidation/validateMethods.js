module.exports = {
  requireFields(data, attributes) {
    if (!data) return "Data object is requiered.";
    for (let i = 0; i < attributes.length; i++) {
      if (!data[attributes[i]]) return `${attributes[i]} is requiered.`;
    }
  },
};
