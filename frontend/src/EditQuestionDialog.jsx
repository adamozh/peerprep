import { useState, useRef, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  Stack,
  MenuItem,
  Box,
} from "@mui/material";
import CustomSnackbar from "./CustomSnackbar";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Editor from "./Editor";
import EditIcon from "@mui/icons-material/Edit";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

function EditQuestionDialog({ question, onEdit }) {
  //   const storedQuestions = JSON.parse(localStorage.getItem("questions"));
  //   const questions = storedQuestions !== null ? storedQuestions : [];
  const [questions, setQuestions] = useState([]);

  const inputRefs = {
    title: useRef(null),
    categories: useRef(null),
    complexity: useRef(null),
    description: useRef(null),
  };

  const [questionData, setQuestionData] = useState({
    title: "",
    categories: "",
    complexity: "",
    description: "",
  });

  const [oldQuestionData, setOldQuestionData] = useState({ ...questionData });

  const categories = [
    "Strings",
    "Algorithms",
    "Data Structures",
    "Bit Manipulation",
    "Recursion",
    "Databases",
    "Brainteaser",
  ];

  var categoryDict = {
    Strings: "STRINGS",
    Algorithms: "ALGORITHMS",
    "Data Structures": "DATA_STRUCTURES",
    "Bit Manipulation": "BIT_MANIPULATION",
    Recursion: "RECURSION",
    Databases: "DATABASES",
    Brainteaser: "BRAINTEASER",
  };

  var reverseDict = {
    'STRINGS': 'Strings',
    'ALGORITHMS': 'Algorithms',
    'DATA_STRUCTURES': 'Data Structures',
    'BIT_MANIPULATION': 'Bit Manipulation',
    'RECURSION': 'Recursion',
    'DATABASES': 'Databases',
    'BRAINTEASER': 'Brainteaser'
  }



  const complexityLevels = ["EASY", "MEDIUM", "HARD"];

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    fetchData();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setsnackbarMessage] = useState("");

  const handleDuplicateQuestion = () => {
    setsnackbarMessage("Duplicate question detected!");
    setSnackbarOpen(true);
  };

  const handleEmptyInputField = () => {
    setsnackbarMessage("Missing fields detected!");
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason == "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleFieldChange = (evt) => {
    const { name, value } = evt.target;
    setQuestionData((prevQuestionData) => ({
      ...prevQuestionData,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setQuestionData((prevQuestionData) => ({
      ...prevQuestionData,
      description: value,
    }));
  };

  const handleCategoriesChange = (evt) => {
    setQuestionData((prevQuestionData) => ({
        ...prevQuestionData,
        categories: evt.target.value,
      }));
  }

  const handleError = (message) => {
    setsnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const title = inputRefs.title.current.value;
    const complexity = inputRefs.complexity.current.value;
    const categories = inputRefs.categories.current.value;
    const description = inputRefs.description.current.value;
    const descriptionClean = description.replace(/<(?!img)[^>]*>/g, "").trim();
    const isDuplicateQuestion =
      questions !== null &&
      questions.some(
        (question) =>
          question.title === title && question.title != oldQuestionData.title
      );

    const isInputFieldEmpty =
      !title || !complexity || !categories || descriptionClean.length == 0;

    if (isDuplicateQuestion) {
      handleDuplicateQuestion();
    } else if (isInputFieldEmpty) {
      handleEmptyInputField();
    } else {
      try {
        for (let i = 0; i < categories.length; i++) {
          categories[i] = categoryDict[categories[i]];
        }
        const newQuestion = {
          title,
          complexity,
          categories,
          description,
        };
        const fieldsToUpdate = Object.keys(newQuestion).reduce((acc, key) => {
          if (oldQuestionData[key] !== newQuestion[key]) {
            acc[key] = newQuestion[key];
          }
          return acc;
        }, {});
        onEdit(question.id, fieldsToUpdate);

        if (Object.keys(fieldsToUpdate).length > 0) {
          setOldQuestionData(fieldsToUpdate);
        }
        handleClose();
      } catch (error) {
        handleError(error.response.data);
        console.error("Error updating question data", error);
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/question/${question.id}`
      );
      const data = response.data;
      const cat = data.categories;
      for (let i = 0; i < cat.length; i++) {
        cat[i] = reverseDict[cat[i]];
      }
      data.categories=cat;
      setQuestionData(data);
      setOldQuestionData(data);
      const storedQuestions = await axios.get(`http://localhost:8080/question`);
      setQuestions(storedQuestions.data);
    } catch (error) {
      console.error("Error fetching question data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <MenuItem onClick={handleClickOpen}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        Edit
      </MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogContent>
          <Box direction="column">
            <Box mb={2}>
              <DialogContentText>
                To edit a new question, please change the fields accordingly.
              </DialogContentText>
            </Box>

            <form
              onSubmit={(evt) => {
                handleSubmit(evt);
              }}
            >
              <Stack spacing={2}>
                <TextField
                  className="textField same-width-textfield"
                  name="title"
                  label="Question Title"
                  value={questionData.title}
                  variant="filled"
                  onChange={handleFieldChange}
                  type="text"
                  inputRef={inputRefs.title}
                ></TextField>
                <InputLabel id="multiple-category-label">Category</InputLabel>
                <Select
                  labelId="multiple-category-label"
                  id="multiple-category"
                  multiple
                  value={questionData.categories}
                  onChange={handleCategoriesChange}
                  inputRef={inputRefs.categories}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  select
                  name="complexity"
                  label="Question Complexity"
                  value={questionData.complexity}
                  variant="filled"
                  onChange={handleFieldChange}
                  inputRef={inputRefs.complexity}
                  className="textField same-width-textfield"
                >
                  {complexityLevels.map((option) => (
                    <MenuItem value={option} key={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <DialogContentText>Question Description</DialogContentText>
                <ReactQuill
                  ref={inputRefs.description}
                  theme="snow"
                  name="description"
                  value={questionData.description}
                  onChange={handleDescriptionChange}
                  modules={Editor.modules}
                  formats={Editor.formats}
                />
              </Stack>
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Question</Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar
        open={isSnackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity="warning"
      ></CustomSnackbar>
    </div>
  );
}

export default EditQuestionDialog;
