const addGHUserInfo = ({ login, avatar }) => {
  $(".replace-user-img").replaceWith(`
        <img src="${avatar}" class="login-image"/>
    `);
  $(".login-info").append(`
        <p class="login-info-text">
            Logged in as ${login}
        </p>
    `);
  $(".star-us-row").remove();
};
export default addGHUserInfo;
