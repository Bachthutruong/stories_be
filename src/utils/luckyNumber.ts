import Post from '../models/Post';

/**
 * Generate the next lucky number in sequence (001-999, then reset to 001)
 * @returns Promise<string> - The next lucky number in 3-digit format (e.g., "001", "002", ..., "999")
 */
export async function generateNextLuckyNumber(): Promise<string> {
  try {
    // Get the highest lucky number currently in use
    const lastPost = await Post.findOne({}, {}, { sort: { createdAt: -1 } });
    
    if (!lastPost || !lastPost.luckyNumber) {
      // If no posts exist, start with 001
      return '001';
    }
    
    // Parse the current lucky number
    const currentNumber = parseInt(lastPost.luckyNumber, 10);
    
    // Calculate next number (001-999, then reset to 001)
    const nextNumber = currentNumber >= 999 ? 1 : currentNumber + 1;
    
    // Format as 3-digit string with leading zeros
    return nextNumber.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating lucky number:', error);
    // Fallback to a random number between 001-999
    const fallbackNumber = Math.floor(Math.random() * 999) + 1;
    return fallbackNumber.toString().padStart(3, '0');
  }
}

/**
 * Get the current lucky number for a specific post
 * @param postId - The post ID
 * @returns Promise<string | null> - The lucky number or null if post not found
 */
export async function getPostLuckyNumber(postId: string): Promise<string | null> {
  try {
    const post = await Post.findById(postId);
    return post?.luckyNumber || null;
  } catch (error) {
    console.error('Error getting post lucky number:', error);
    return null;
  }
}
