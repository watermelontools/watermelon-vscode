const replaceHyperlinks = (text) => {
    let hyperlinkArray = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm);

    let trimmedHyperlinks = [];

    hyperlinkArray.forEach(element => {
      console.log("element: ", element);

      if (element.charAt(element.length - 1) === ")") {
        let newElement = element.slice(0, -1);
        trimmedHyperlinks.push(newElement);
      }
    });

    return text
      .replaceAll(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm,
        `<a href=${trimmedHyperlinks[0]}>${trimmedHyperlinks[0]}</a>`
      );
  };
  export default replaceHyperlinks;