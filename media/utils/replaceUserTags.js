const replaceUserTags = (text) => {
  return text
    .replace(
      /\B@([a-z0-9](?:-(?=[a-z0-9])|[a-z0-9]){0,38}(?<=[a-z0-9]))/gi,
      `<a href="https://github.com/$&" title="View this user on github">$&</a>`.toLowerCase()
    )
    .replaceAll("/@", "/");
};
export default replaceUserTags;
