import * as React from "react";
import { IconButton, Link } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useEffect } from "react";
import axios from "axios";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import "react-quill/dist/quill.snow.css";
import EditQuestionDialog from "./EditQuestionDialog";

function Question({ question, questionId, onDelete, onEdit }) {
  const databaseURL = import.meta.env.VITE_DATABASE_URL;
  const categories = question.categories.join(", ");
  const [open, setOpen] = React.useState(false);
  const handleOpen = async () => {
    loadDesciption();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [description, setDescription] = React.useState("");

  const loadDesciption = async () => {
    const response = await axios.get(`${databaseURL}/question/${question.id}`);
    setDescription(response.data.description);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openActions = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseActions = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    loadDesciption();
  }, []);

  return (
    <TableRow key={question.title}>
      <TableCell align="center">{questionId}</TableCell>
      <TableCell>
        <Link onClick={handleOpen}>{question.title}</Link>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Question Description</DialogTitle>
          <DialogContent>
            <DialogContentText
              dangerouslySetInnerHTML={{ __html: description }}
            ></DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </TableCell>
      <TableCell>{categories}</TableCell>
      <TableCell align="center">{question.complexity}</TableCell>
      <TableCell>
        <IconButton
          id="long-button"
          aria-haspopup="true"
          onClick={handleClick}
          style={{ outline: "none" }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={openActions}
          onClose={handleCloseActions}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <EditQuestionDialog question={question} onEdit={onEdit} />
          <MenuItem onClick={() => onDelete(question.id)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}

export default Question;
