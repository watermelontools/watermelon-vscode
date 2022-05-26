const addSessionToFooter = (session) => {
    $('footer').append(`
    <div>
        <div class="footer-container">
            <p>Local session: ${session}</p>
        </div>
    </div>`);
};
export default addSessionToFooter;