function confirmDeletionuser(userId) {
    swal({
      title: "Are you sure?",
      text: "Do you really want to remove this user from the system ?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        document.getElementById("deleteForm-" + userId).submit();
      }
    });
  }

  function confirmDeletiontrip(tripId) {
    swal({
        title: "Are you sure?",
        text: "Do you really want to remove this trip from the system ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            document.getElementById('deleteForm-' + tripId).submit();
        }
    });
}
function confirmDeletionhotel(hotelId) {
  swal({
      title: "Are you sure?",
      text: "Do you really want to remove this hotel from the system ?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  }).then((willDelete) => {
      if (willDelete) {
          document.getElementById('deleteForm-' + hotelId).submit();
      }
  });
}
function confirmDeletionbooking(bookingId) {
  swal({
      title: "Are you sure?",
      text: "Do you really want to remove this booking from the system ?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  }).then((willDelete) => {
      if (willDelete) {
          document.getElementById('deleteForm-' + bookingId).submit();
      }
  });
}

function confirmDeletionreview(reviewId) {
  swal({
      title: "Are you sure?",
      text: "Do you really want to remove this review from the system ?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  }).then((willDelete) => {
      if (willDelete) {
          document.getElementById('deleteForm-' + reviewId).submit();
      }
  });
}