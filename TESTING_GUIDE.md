# FlowG Testing Guide 🚀

## Quick Test: Create Your First Workflow

### Step 1: Start the Development Server
```bash
cd /Users/wali/Downloads/flowg
npm run dev
```
Open http://localhost:3000

### Step 2: Create a Simple Test Workflow

#### Basic Input → AI Compute → Output Workflow:

1. **Add an Input Node:**
   - From the left sidebar, drag the "Input" node onto the canvas
   - This provides data to your workflow

2. **Add an AI Compute Node:**
   - Drag the "AI Compute" node onto the canvas
   - This simulates AI processing (takes 3 seconds to execute)

3. **Add an Output Node:**
   - Drag the "Output" node onto the canvas
   - This displays the results

4. **Connect the Nodes:**
   - Click and drag from the **right handle** of the Input node
   - Connect it to the **left handle** of the AI Compute node
   - Then connect the AI Compute node to the Output node
   - You should see animated dotted lines connecting them

### Step 3: Execute the Workflow

1. **Click the Execute Button:**
   - The "Execute" button in the top toolbar should now be clickable
   - Click it to start the workflow execution

2. **Watch the Execution:**
   - Each node will show a status indicator (small dot in top-right):
     - Gray dot = Idle
     - Black pulsing dot = Running
     - Solid black dot = Completed
   - Check the browser console (F12) for detailed execution logs
   - You'll see step-by-step progress with emojis

3. **Expected Behavior:**
   - Input node executes first (1.5 seconds)
   - AI Compute node executes next (3 seconds) 
   - Output node executes last (1.5 seconds)
   - Success alert appears when complete
   - All nodes reset to idle after 3 seconds

### Step 4: Advanced Testing

#### Test Different Node Types:
- **Storage Node:** Drag and connect for data storage simulation
- **Logic Node:** Add conditional logic to your workflow  
- **Chain Interaction:** Connect to blockchain operations
- **Image Gen:** Test image generation workflows

#### Test Complex Workflows:
```
Input → Logic → AI Compute → Storage
  ↓                           ↓
Output ← Chain Interaction ←──┘
```

### Troubleshooting

**Execute Button Not Working?**
- Make sure you have at least one node on the canvas
- Check the browser console for errors
- Try refreshing the page

**Nodes Not Connecting?**
- Drag from the small circle on the right side of a node
- Drop on the small circle on the left side of the target node
- The connection should show as an animated dotted line

**Console Messages to Look For:**
- 🚀 Starting workflow execution...
- 📊 Executing workflow with X nodes and Y connections  
- ⚡ Executing node: [node name]
- ✅ Completed node: [node name]
- 🎉 Workflow execution completed!

### Expected Performance
- Small workflows (1-3 nodes): ~5-10 seconds
- AI Compute nodes take longer (3 seconds each)
- Visual feedback throughout execution
- Automatic status reset after completion

Your workflow should now be fully functional! 🎉