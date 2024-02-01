// TODO: Wire up the app's behavior here.
const logItems = $('ul[data-cy="logs"] li');
const courseSelector = $('#course');
const logs = $('#logs');
const uvuIdInput = $('#uvuId');
const addLogBtn = $('button[data-cy="add_log_btn"]');
const logTextarea = $('textarea[data-cy="log_textarea"]');

const courseUrl = './courses';
const logUrl = './logs';

// Fetch data from the server for courses.
$.ajax({
  url: courseUrl,
  method: 'GET',
  dataType: 'json',
  success: function (data) {
    console.log('Fetched data:', data);

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format. Expected an array.');
    }
    const firstOption = $('<option>', { text: 'Choose Courses' });
    // Add a new option for each course in the fetched data
    data.forEach((course) => {
      const option = $('<option>', {
        value: course.id, // Assuming each course object has an 'id' property
        text: course.display, // Correcting the property to 'display'
      });
      courseSelector.append(option);
    });
  },
  error: function (error) {
    console.error('Error fetching or processing data:', error);
  },
});

// Add change event listener to the course select element
courseSelector.on('change', function () {
  // Check if a course is selected
  if (courseSelector.val()) {
    // Show the UVU ID input
    uvuIdInput.css('display', 'block');
  } else {
    // Hide the UVU ID input if no course is selected
    uvuIdInput.css('display', 'none');
  }
});

// Add input event listener to the UVU ID input for character length validation
uvuIdInput.on('input', function () {
  const uvuId = uvuIdInput.val();

  // Check if all characters are numbers
  const allCharactersAreNumbers = /^\d+$/.test(uvuId);

  // Update the input border color based on the validation result
  uvuIdInput.css('borderColor', allCharactersAreNumbers ? '' : 'red');

  // Check if the UVU ID is 8 digits
  if (allCharactersAreNumbers && uvuId.length === 8) {
    $.ajax({
      url: logUrl,
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        console.log('Fetched data:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format. Expected an array.');
        }

        // Clear existing logs before fetching and displaying new ones
        logs.empty();
        // Assuming uvuIdDisplay is not needed
        // uvuIdDisplay.text(`Student Logs for ${uvuId}`);

        // Add a new li element for each log in the fetched data
        data.forEach((log) => {
          const listItem = $('<li>');

          // Create the content for the li element
          listItem.html(`
            <div><small>${log.date}</small></div>
            <pre><p>${log.text}</p></pre>
          `);

          // Append the li element to the logs ul
          logs.append(listItem);

          // Add click event listener to each li element
          listItem.on('click', () => {
            // Toggle the visibility of the pre element (comment)
            const comment = listItem.find('pre p');
            comment.css('display', comment.css('display') === 'none' ? 'block' : 'none');
          });
        });
      },
      error: function (error) {
        console.error('Error fetching or processing data:', error);
      },
    });

    // Assuming uvuIdInput.val(uvuId); is not needed
    console.log('Valid UVU ID:', uvuId);
  } else {
    // Clear any previous results or messages
    console.log('Invalid UVU ID');
  }
  toggleAddLogButton();
});

function toggleAddLogButton() {
  addLogBtn.prop('disabled', !(logs.html().trim() !== '' && logTextarea.val().trim() !== ''));
}

logTextarea.on('input', function () {
  // Toggle the "Add Log" button based on conditions
  toggleAddLogButton();
});

addLogBtn.on('click', function (event) {
  event.preventDefault();

  const uvuId = uvuIdInput.val();
  const courseId = courseSelector.val();
  const logText = logTextarea.val();

  // Check if all necessary information is available
  if (uvuId && courseId && logText) {
    // TODO: Use AJAX PUT to send the log data to json-server

    // Get the current date and time
    const currentDate = new Date().toLocaleString();
    $.ajax({
      url: logUrl,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        uvuId: uvuId,
        courseId: courseId,
        date: currentDate,
        text: logText,
      }),
      success: function (data) {
        // Log success or handle response as needed
        console.log('Log added successfully:', data);

        // Clear the log textarea
        logTextarea.val('');

        // Refresh the displayed logs
        uvuIdInput.trigger('input');
      },
      error: function (error) {
        console.error('Error adding log:', error);
      },
    });
  }
});
