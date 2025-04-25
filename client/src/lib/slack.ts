// Note: We're removing the direct import of WebClient because it has Node.js dependencies
// Instead, we'll use browser-compatible APIs and mock the functionality we need

// Types for Slack API (browser compatible)
export interface SlackClient {
  fetchUsers: () => Promise<SlackUser[]>;
  fetchChannels: () => Promise<SlackChannel[]>;
  fetchChannelMessages: (channelId: string, limit?: number) => Promise<SlackMessage[]>;
}

// We'll use this mock client for now
// In a real app, we would use fetch API to call Slack API endpoints
export const createSlackClient = (token: string): SlackClient => {
  return {
    fetchUsers: async () => [],
    fetchChannels: async () => [],
    fetchChannelMessages: async () => []
  };
};

export interface SlackUser {
  id: string;
  name: string;
  realName: string;
  isBot: boolean;
  avatar: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
}

export interface SlackMessage {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  attachments?: any[];
  files?: any[];
  mentions?: string[];
}

/**
 * Generate mock data for Slack users
 */
export const generateMockSlackUsers = (): SlackUser[] => {
  return [
    {
      id: 'U001',
      name: 'john.smith',
      realName: 'John Smith',
      isBot: false,
      avatar: ''
    },
    {
      id: 'U002',
      name: 'sarah.johnson',
      realName: 'Sarah Johnson',
      isBot: false,
      avatar: ''
    },
    {
      id: 'U003',
      name: 'robert.williams',
      realName: 'Robert Williams',
      isBot: false,
      avatar: ''
    }
  ];
};

/**
 * Generate mock data for Slack channels
 */
export const generateMockSlackChannels = (): SlackChannel[] => {
  return [
    {
      id: 'C001',
      name: 'general',
      topic: 'Company-wide announcements and work-related matters',
      memberCount: 3
    },
    {
      id: 'C002',
      name: 'random',
      topic: 'Non-work banter and water cooler conversation',
      memberCount: 3
    },
    {
      id: 'C003',
      name: 'project-alpha',
      topic: 'Project Alpha discussion',
      memberCount: 2
    }
  ];
};

/**
 * Generate mock data for Slack messages
 */
export const generateMockChannelMessages = (channelId: string): SlackMessage[] => {
  // Different messages for different channels
  if (channelId === 'C001') {
    return [
      {
        id: 'M001',
        text: 'Hello team! Welcome to the general channel',
        user: 'U001',
        timestamp: '1619712000'
      },
      {
        id: 'M002',
        text: 'Thanks @U001! Glad to be here',
        user: 'U002',
        timestamp: '1619712060',
        mentions: ['U001']
      }
    ];
  } else if (channelId === 'C002') {
    return [
      {
        id: 'M003',
        text: 'Anyone watching the game tonight?',
        user: 'U003',
        timestamp: '1619798400'
      },
      {
        id: 'M004',
        text: 'Yes! Can\'t wait! @U003',
        user: 'U001',
        timestamp: '1619798460',
        mentions: ['U003']
      }
    ];
  } else {
    return [
      {
        id: 'M005',
        text: 'Project meeting tomorrow at 10am',
        user: 'U002',
        timestamp: '1619884800'
      }
    ];
  }
};

/**
 * Extracts user mentions from message text
 */
const extractMentions = (text: string): string[] => {
  const mentionRegex = /<@([A-Z0-9]+)>/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

/**
 * Generates mock graph data from Slack
 * This is a browser-compatible version that doesn't rely on the Slack API
 */
export const generateSlackGraphData = async (): Promise<SlackGraphData> => {
  try {
    // Get mock data
    const users = generateMockSlackUsers();
    const channels = generateMockSlackChannels();
    
    // Build nodes and edges
    const nodes: SlackGraphData['nodes'] = [];
    const edges: SlackGraphData['edges'] = [];
    
    // Add users as nodes
    users.forEach(user => {
      nodes.push({
        id: user.id,
        label: user.realName,
        type: 'user',
        data: user
      });
    });
    
    // Add channels as nodes
    channels.forEach(channel => {
      nodes.push({
        id: channel.id,
        label: channel.name,
        type: 'channel',
        data: channel
      });
    });
    
    // Add channel membership edges
    // For demo purposes, all users are members of channel C001 (general)
    users.forEach(user => {
      edges.push({
        id: `${user.id}-C001`,
        source: user.id,
        target: 'C001',
        label: 'member_of',
        weight: 1
      });
    });
    
    // Add user interaction edges based on mock message mentions
    const generalMessages = generateMockChannelMessages('C001');
    const randomMessages = generateMockChannelMessages('C002');
    const allMessages = [...generalMessages, ...randomMessages];
    
    // Process mentions in messages to create interaction edges
    allMessages.forEach(message => {
      if (message.mentions && message.mentions.length > 0) {
        message.mentions.forEach(mentionedUser => {
          edges.push({
            id: `${message.user}-${mentionedUser}`,
            source: message.user,
            target: mentionedUser,
            label: 'interacts_with',
            weight: 1
          });
        });
      }
    });
    
    // Add some additional interactions for demonstration purposes
    edges.push({
      id: 'U001-U002-collab',
      source: 'U001',
      target: 'U002',
      label: 'interacts_with',
      weight: 3
    });
    
    edges.push({
      id: 'U002-U003-collab',
      source: 'U002',
      target: 'U003',
      label: 'interacts_with',
      weight: 2
    });
    
    return { nodes, edges };
  } catch (error) {
    console.error("Error generating Slack graph data:", error);
    // Return a minimal fallback dataset in case of errors
    return {
      nodes: [
        { id: 'U001', label: 'User 1', type: 'user', data: {} },
        { id: 'C001', label: 'general', type: 'channel', data: {} }
      ],
      edges: [
        { id: 'e1', source: 'U001', target: 'C001', label: 'member_of', weight: 1 }
      ]
    };
  }
};

export interface SlackGraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: 'user' | 'channel';
    data: any;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    weight: number;
  }>;
}

/**
 * Transforms Slack graph data into the EKG data model format
 */
export const transformSlackToEKG = (graphData: SlackGraphData) => {
  // Extract user and channel nodes
  const userNodes = graphData.nodes.filter(node => node.type === 'user');
  const channelNodes = graphData.nodes.filter(node => node.type === 'channel');
  
  // Extract interactions between users
  const userInteractions = graphData.edges.filter(edge => 
    edge.label === 'interacts_with' &&
    graphData.nodes.find(n => n.id === edge.source)?.type === 'user' &&
    graphData.nodes.find(n => n.id === edge.target)?.type === 'user'
  );
  
  // Extract channel memberships
  const channelMemberships = graphData.edges.filter(edge => 
    edge.label === 'member_of' &&
    graphData.nodes.find(n => n.id === edge.source)?.type === 'user' &&
    graphData.nodes.find(n => n.id === edge.target)?.type === 'channel'
  );
  
  // Set up default EKG settings for Slack data
  const ekgSettings = {
    // DMOs will include Person and Channel
    dmos: [
      {
        id: 'person',
        name: 'Person',
        description: 'Person or user entity from Slack',
        selected: true,
        required: true
      },
      {
        id: 'channel',
        name: 'Channel',
        description: 'Channel from Slack workspace',
        selected: true,
        required: true
      }
    ],
    
    // Edges will include Collaborates and MemberOf
    edges: [
      {
        id: 'collaborates',
        name: 'Collaborates',
        fromNodeType: 'person',
        toNodeType: 'person',
        isBidirectional: true,
        attributes: [
          { id: 'collab-1', name: 'interaction_count', type: 'number' }
        ]
      },
      {
        id: 'member_of',
        name: 'MemberOf',
        fromNodeType: 'person',
        toNodeType: 'channel',
        isBidirectional: false,
        attributes: []
      }
    ],
    
    // Analytics: who knows who is enabled by default for slack data
    enabledAnalytics: {
      whoKnowsWho: true,
      whoDoesWhat: true,
      centralityAnalysis: true,
      communityDetection: false
    }
  };
  
  return ekgSettings;
};