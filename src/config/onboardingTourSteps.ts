export const tourSteps = [
  {
    selector: '[data-tour="shapes"]',
    content: "You can choose shapes from here",
  },
  {
    selector: '[data-tour="shapes-htmlcss"]',
    content:
      "You can also add your own shapes using HTML and CSS. You can only use id selectors. Before and after pseudo-elements are not supported",
  },
  {
    selector: '[data-tour="preset-animations"]',
    content: "There are some preset animations you can use",
  },
  {
    selector: '[data-tour="storage-buttons"]',
    content:
      "You can save your animation by clicking Cmd/Ctrl Z or click ont the save animation button so on reload it will be restored. You can also reset the canvas to start fresh",
  },

  {
    selector: '[data-tour="canvas"]',
    content:
      "Here is the main animation preview. You can drag and drop the shapes, rotate , resize  and position them as you like. By pressing Shift, you can resize shapes proportionally and rotate them in 15° increments. You can delete a shape by pressing on Backspace",
  },
  {
    selector: '[data-tour="properties-panel-config"]',
    content:
      "Here you can configure the animation properties of the selected layer",
  },
  {
    selector: '[data-tour="properties-panel-properties"]',
    content:
      "Here you can edit the properties of the selected layer. By editintg the values, you can create keyframes in the timeline editor on the position of the playhead",
  },
  {
    selector: '[data-tour="timeline"]',
    content: "This is the timeline editor for keyframes and timing",
  },
  {
    selector: '[data-tour="timeline-controls"]',
    content: "These are the controls to navigate through your animation",
  },
  //
  {
    selector: '[data-tour="restart"]',
    content: "Click here to restart the animation",
  },
  {
    selector: '[data-tour="step-backward"]',
    content: "Click here to move one second backward in the animation",
  },
  {
    selector: '[data-tour="move-to-previous-keyframe"]',
    content:
      "This button moves the playhead to the previous keyframe in the timeline",
  },
  {
    selector: '[data-tour="play-pause"]',
    content:
      "Click here to play or pause the animation. You can also use the spacebar",
  },
  {
    selector: '[data-tour="move-to-next-keyframe"]',
    content:
      "This button moves the playhead to the next keyframe in the timeline",
  },
  {
    selector: '[data-tour="step-forward"]',
    content: "Click here to move one second forward in the animation.",
  },
  {
    selector: '[data-tour="jump-to-end"]',
    content: "Click here to jump to the end of the animation",
  },
  //
  {
    selector: '[data-tour="timeline-header"]',
    content: "Here you can see the time and progress of the animation",
  },
  {
    selector: '[data-tour="timeline-layer-row"]',
    content:
      "This is a layer row where you can manage individual layers. You can rename, duplicate, delete, hide or lock the layer. You can also drag the layers to reorder them",
  },
  {
    selector: '[data-tour="layer-settings"]',
    content:
      "This is the layer settings panel. Here you can configure the default properties of the selected layer",
  },
  {
    selector: '[data-tour="timeline-keyframes"]',
    content:
      "Here you can view, manage, and add keyframes for the selected layer. You can add keyframes by placing the playhead  somewhere in the timeline and edit a property in the properties menu. You can move a keyframe by dragging it, delete it with Backspace, or edit by aligning the playhead with the keyframe. You can alo copy a keyframe by selecting it and pressing Ctrl+C, keep it selected, then paste it with Ctrl+V",
  },
  {
    selector: '[data-tour="generate-css"]',
    content: "Click here to export your animation as HTML and CSS code",
  },
];
