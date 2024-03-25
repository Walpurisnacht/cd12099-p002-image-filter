import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';



// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());
/**
 * @route   GET /filteredimage
 * @desc    Validate the image_url query then filter the image, sending the resulting file in the response
 *          then delete any files on the server on finish of the response
 * @access  Public
 * @returns 200 - Filtered image file
 * @returns {Error} 422 - Missing image_url parameter
 */
app.get("/filteredimage", async (req, res) => {
  let image_url = req.query.image_url.toString()
  // Validate params
  if (!image_url) {
    res.status(422).send("Please provide image_url!")
  }
  // Begin filter image
  let filtered_path = await filterImageFromURL(image_url)
  // Return OK for filtered image
  res.status(200).sendFile(filtered_path, () => {
    // Clean up
    deleteLocalFiles([filtered_path])
  })

});

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}")
});

// Catch-all route for handling invalid endpoints
app.use((req, res, next) => {
  const error = new Error('HTTP 404: NOT A VALID URL!');
  error.status = 404;
  next(error);
});

// Error handling request return
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message)
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
