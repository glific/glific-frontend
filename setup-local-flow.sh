#!/bin/bash


# CHANGE THIS PATH to your actual local flow-editor repository path
LOCAL_FLOW_EDITOR_PATH=/Users/akanshasakhre/Desktop/glific/platform/floweditor


echo "🔨 Building local flow-editor..."
cd "$LOCAL_FLOW_EDITOR_PATH"
npm run build


echo "📁 Copying files to glific-frontend..."
cd -  # Go back to glific-frontend directory


# Copy the built files
cp -r "$LOCAL_FLOW_EDITOR_PATH/build/static" public/
cp "$LOCAL_FLOW_EDITOR_PATH/build/asset-manifest.json" public/


echo "✅ Done! Local flow-editor is now being used."