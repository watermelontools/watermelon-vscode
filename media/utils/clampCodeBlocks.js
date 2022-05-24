function clampCodeBlocks() {
  $("code").each(function (index, element) {
    // replace each with the clamped version and a see more button
    if ($(this).text().length > 100) {
      $(this).addClass("clamp");
      $(this).after("<button class='see-more'>See More</button>");
    }
    // now restore the text when the button was clicked
    $(".see-more").on("click", function () {
      $(this).prev().removeClass("clamp");
      $(this).remove();
    });
  });
}
export default clampCodeBlocks;
