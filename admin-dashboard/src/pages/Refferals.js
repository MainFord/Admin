// src/components/Referrals.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Modal,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { Search, ZoomIn, ZoomOut, Refresh } from '@mui/icons-material';
import { FaUserCircle } from 'react-icons/fa';
import Tree from 'react-d3-tree';
import api from '../services/api';

// Styles for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
};

// Utility function to search and highlight nodes
const searchTree = (node, searchTerm, path = []) => {
  if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    return [...path, node];
  }
  if (node.children) {
    for (let child of node.children) {
      const result = searchTree(child, searchTerm, [...path, node]);
      if (result.length) {
        return result;
      }
    }
  }
  return [];
};

// Utility function to transform 'referrals' to 'children'
const transformReferralTree = (node) => {
  if (!node) return null;

  const { referrals, ...rest } = node;
  const children = referrals ? referrals.map(transformReferralTree) : [];

  return {
    ...rest,
    children,
  };
};

const Referrals = () => {
  const [treeData, setTreeData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightPath, setHighlightPath] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const treeContainer = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (treeContainer.current) {
        setDimensions({
          width: treeContainer.current.offsetWidth,
          height: treeContainer.current.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real data if available
  useEffect(() => {
    const fetchReferralData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/referrals/66f69bfea34d00c7e5915adc'); // Replace with actual endpoint and userId
        const transformedData = transformReferralTree(response.data.referralTree);
        setTreeData(transformedData);
      } catch (err) {
        setError('Failed to fetch referral data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchReferralData();
  }, []);

  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setHighlightPath([]);
      return;
    }
    const path = searchTree(treeData, searchTerm.trim());
    setHighlightPath(path);
  };

  // Handle node click to open modal
  const handleNodeClick = (nodeData) => {
    setSelectedUser(nodeData);
    setModalOpen(true);
  };

  // Custom node rendering with enhanced design
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    // Determine if the node is the root based on its depth
    const isRoot = nodeDatum.__rd3t.depth === 0;

    const isHighlighted =
      highlightPath.find((node) => node.name === nodeDatum.name) !== undefined;

    const nodeName = nodeDatum.name || 'Unnamed';

    // Assuming nodeDatum.image contains the URL to the user's avatar
    const avatarUrl = nodeDatum.image || null;

    // Define colors
    const rootColor = '#FF5722'; // Example color for root
    const defaultColor = '#4CAF50'; // Default color for other nodes
    const highlightedColor = '#FF9800'; // Color when highlighted

    return (
      <g>
        <Tooltip title={nodeName} arrow>
          <g onClick={() => handleNodeClick(nodeDatum)} style={{ cursor: 'pointer' }}>
            <circle
              r={20}
              fill={
                isRoot
                  ? rootColor
                  : isHighlighted
                  ? highlightedColor
                  : defaultColor
              }
              stroke="#fff"
              strokeWidth={isHighlighted ? 4 : isRoot ? 4 : 2}
            />
            {avatarUrl ? (
              <image
                href={avatarUrl}
                x="-15"
                y="-15"
                height="30"
                width="30"
                clipPath="circle(15px at 15px 15px)"
              />
            ) : (
              <FaUserCircle
                style={{
                  position: 'absolute',
                  width: '30px',
                  height: '30px',
                  fill: '#fff',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
          </g>
        </Tooltip>
        <text
          fill="#333"
          fontSize="12"
          x="0"
          y="-25" // Position the label above the node
          textAnchor="left" // Center the text
          style={{ pointerEvents: 'none', fontWeight: isHighlighted ? 'bold' : 'normal' }}
        >
          {nodeName}
        </text>
      </g>
    );
  };

  return (
    <Box
      sx={{
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search and Zoom Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'start',
          padding: 2, // Add some padding for the controls
          backgroundColor: 'white',
        }}
      >
        <TextField
          label="Search User"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSearch}>
                <Search />
              </IconButton>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <Box>
          <Tooltip title="Zoom In">
            <IconButton onClick={() => setZoom((prev) => prev + 0.2)}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton
              onClick={() =>
                setZoom((prev) => (prev > 0.4 ? prev - 0.2 : prev))
              }
            >
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={() => setZoom(1)}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tree Visualization */}
      {treeData && (
        <Box
          ref={treeContainer}
          sx={{
            flexGrow: 1,
            width: '100%',
            overflow: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: 2,
          }}
        >
          <Tree
            data={treeData}
            translate={{ x: dimensions.width / 2, y: 50 }} // Position root at top center
            orientation="vertical" // Tree grows downwards
            pathFunc="diagonal" // Curved links
            renderCustomNodeElement={renderCustomNode}
            collapsible={true}
            zoomable={true}
            separation={{ siblings: 2, nonSiblings: 2 }}
            scaleExtent={{ min: 0.1, max: 2 }}
            zoom={zoom}
            initialDepth={2}
            styles={{
              links: {
                stroke: '#b0bec5',
                strokeWidth: 2,
                opacity: 0.8,
              },
              nodes: {
                node: {
                  circle: {
                    stroke: '#4caf50',
                    strokeWidth: 3,
                  },
                  name: {
                    stroke: '#000',
                    strokeWidth: 1.5,
                  },
                },
                leafNode: {
                  circle: {
                    stroke: '#8e24aa',
                    strokeWidth: 3,
                  },
                  name: {
                    stroke: '#000',
                    strokeWidth: 1.5,
                  },
                },
              },
            }}
            allowForeignObjects={true}
          />
        </Box>
      )}

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* User Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="user-details-title"
        aria-describedby="user-details-description"
      >
        <Box sx={modalStyle}>
          {selectedUser ? (
            <Card>
              <CardHeader
                avatar={
                  <Avatar src={selectedUser.image || ''}>
                    {!selectedUser.image && <FaUserCircle />}
                  </Avatar>
                }
                title={selectedUser.name}
                subheader={selectedUser.email}
              />
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {selectedUser.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Referral Code:</strong> {selectedUser.referralCode}
                </Typography>
                {/* Add more user details here if available */}
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body1">No user selected.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Referrals;
