import { WebClient } from "@slack/web-api";

// We'll initialize the client when we have the token
let slackClient: WebClient | null = null;

export const initializeSlackClient = (token: string): WebClient => {
  slackClient = new WebClient(token);
  return slackClient;
};

export const getSlackClient = (): WebClient | null => {
  return slackClient;
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
 * Fetches users from Slack workspace
 */
export const fetchSlackUsers = async (): Promise<SlackUser[]> => {
  if (!slackClient) {
    throw new Error("Slack client not initialized");
  }

  try {
    const response = await slackClient.users.list();
    
    if (!response.ok || !response.members) {
      throw new Error("Failed to fetch Slack users");
    }

    return response.members
      .filter(user => !user.deleted && user.id !== 'USLACKBOT')
      .map(user => ({
        id: user.id || '',
        name: user.name || '',
        realName: user.real_name || user.name || '',
        isBot: user.is_bot || false,
        avatar: user.profile?.image_72 || ''
      }));
  } catch (error) {
    console.error("Error fetching Slack users:", error);
    throw error;
  }
};

/**
 * Fetches channels from Slack workspace
 */
export const fetchSlackChannels = async (): Promise<SlackChannel[]> => {
  if (!slackClient) {
    throw new Error("Slack client not initialized");
  }

  try {
    const response = await slackClient.conversations.list({
      types: 'public_channel,private_channel'
    });
    
    if (!response.ok || !response.channels) {
      throw new Error("Failed to fetch Slack channels");
    }

    return response.channels.map(channel => ({
      id: channel.id || '',
      name: channel.name || '',
      topic: channel.topic?.value || '',
      memberCount: channel.num_members || 0
    }));
  } catch (error) {
    console.error("Error fetching Slack channels:", error);
    throw error;
  }
};

/**
 * Fetches messages from a specific Slack channel
 */
export const fetchChannelMessages = async (channelId: string, limit = 100): Promise<SlackMessage[]> => {
  if (!slackClient) {
    throw new Error("Slack client not initialized");
  }

  try {
    const response = await slackClient.conversations.history({
      channel: channelId,
      limit
    });
    
    if (!response.ok || !response.messages) {
      throw new Error(`Failed to fetch messages for channel ${channelId}`);
    }

    return response.messages.map(msg => ({
      id: msg.ts || '',
      text: msg.text || '',
      user: msg.user || '',
      timestamp: msg.ts || '',
      reactions: msg.reactions?.map(reaction => ({
        name: reaction.name || '',
        count: reaction.count || 0,
        users: reaction.users || []
      })),
      attachments: msg.attachments,
      files: msg.files,
      mentions: extractMentions(msg.text || '')
    }));
  } catch (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error);
    throw error;
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
 * Generates graph data from Slack
 */
export const generateSlackGraphData = async () => {
  try {
    // Fetch users and channels
    const users = await fetchSlackUsers();
    const channels = await fetchSlackChannels();
    
    // Build nodes and edges
    const nodes: Array<{
      id: string;
      label: string;
      type: 'user' | 'channel';
      data: SlackUser | SlackChannel;
    }> = [];
    
    const edges: Array<{
      id: string;
      source: string;
      target: string;
      label: string;
      weight: number;
    }> = [];
    
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
    
    // Process channel membership and messages
    for (const channel of channels) {
      // Get channel members
      const membersResponse = await slackClient?.conversations.members({
        channel: channel.id
      });
      
      if (membersResponse?.ok && membersResponse.members) {
        // Add edges for channel membership
        membersResponse.members.forEach(memberId => {
          edges.push({
            id: `${memberId}-${channel.id}`,
            source: memberId,
            target: channel.id,
            label: 'member_of',
            weight: 1
          });
        });
        
        // Get channel messages
        const messages = await fetchChannelMessages(channel.id, 50);
        
        // Process message interactions
        const userInteractions = new Map<string, Map<string, number>>();
        
        messages.forEach(message => {
          if (!message.user) return;
          
          // Process mentions
          if (message.mentions && message.mentions.length > 0) {
            message.mentions.forEach(mentionedUser => {
              if (!userInteractions.has(message.user)) {
                userInteractions.set(message.user, new Map<string, number>());
              }
              
              const userMap = userInteractions.get(message.user)!;
              userMap.set(mentionedUser, (userMap.get(mentionedUser) || 0) + 1);
            });
          }
          
          // Process reactions
          if (message.reactions && message.reactions.length > 0) {
            message.reactions.forEach(reaction => {
              reaction.users.forEach(reactingUser => {
                if (reactingUser === message.user) return;
                
                if (!userInteractions.has(reactingUser)) {
                  userInteractions.set(reactingUser, new Map<string, number>());
                }
                
                const userMap = userInteractions.get(reactingUser)!;
                userMap.set(message.user, (userMap.get(message.user) || 0) + 1);
              });
            });
          }
        });
        
        // Add edges for user interactions
        userInteractions.forEach((interactions, sourceUser) => {
          interactions.forEach((weight, targetUser) => {
            edges.push({
              id: `${sourceUser}-${targetUser}`,
              source: sourceUser,
              target: targetUser,
              label: 'interacts_with',
              weight
            });
          });
        });
      }
    }
    
    return { nodes, edges };
  } catch (error) {
    console.error("Error generating Slack graph data:", error);
    throw error;
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