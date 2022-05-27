const addVersionToFooter = (version) => {
    $('footer').append(`
    <div>
        <p>Watermelon extension version: ${version}</p>
    </div>`);
};
export default addVersionToFooter;