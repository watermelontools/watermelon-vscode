const addGHUserInfo = ({ login, avatar, isStarred }) => {
  $(".replace-user-img").replaceWith(`
        <img src="${avatar}" class="login-image"/>
    `);
  $(".login-info").replaceWith(`
        <p class="login-info-text">
            Logged in as ${login}
        </p>
    `);
  isStarred && $(".star-us-row").remove();
};
export default addGHUserInfo;
