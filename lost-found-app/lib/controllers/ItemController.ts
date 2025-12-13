/**
 * MONOLITHIC APPLICATION LAYER: /controllers
 * 
 * Item Controller
 * Handles incoming HTTP requests for items (lost/found)
 * Validates input, delegates to services, formats responses
 */

import { NextResponse } from 'next/server';
import { ItemService } from '@/lib/services/ItemService';
import { getUserFromCookies } from '@/lib/auth';
import { IItemCreateRequest } from '@/lib/models/Item';

export class ItemController {
  /**
   * GET /api/items
   * Get all items with pagination and filters
   */
  static async getAll(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const category = searchParams.get('category');
      const itemStatus = searchParams.get('itemStatus');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const result = await ItemService.getAllItems({
        status: status || undefined,
        category: category || undefined,
        itemStatus: itemStatus || undefined,
        page,
        limit,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      console.error('Get items error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch items' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/items/[id]
   * Get single item by ID
   */
  static async getById(id: number) {
    try {
      const item = await ItemService.getItemById(id);

      return NextResponse.json(
        {
          success: true,
          item,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get item error:', error);
      return NextResponse.json(
        { error: error.message || 'Item not found' },
        { status: 404 }
      );
    }
  }

  /**
   * POST /api/items
   * Create a new item
   */
  static async create(request: Request) {
    try {
      // Get authenticated user
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const body = await request.json();

      // Validate required fields
      if (!body.title || !body.description || !body.category || !body.status) {
        return NextResponse.json(
          { error: 'Title, description, category, and status are required' },
          { status: 400 }
        );
      }

      const item = await ItemService.createItem(user.userId, body);

      return NextResponse.json(
        {
          success: true,
          message: 'Item created successfully',
          item,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Create item error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create item' },
        { status: 400 }
      );
    }
  }

  /**
   * PUT /api/items/[id]
   * Update item
   */
  static async update(request: Request, id: number) {
    try {
      // Get authenticated user
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const item = await ItemService.updateItem(id, user.userId, body);

      return NextResponse.json(
        {
          success: true,
          message: 'Item updated successfully',
          item,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Update item error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update item' },
        { status: error.message.includes('permission') ? 403 : 400 }
      );
    }
  }

  /**
   * DELETE /api/items/[id]
   * Delete item
   */
  static async delete(request: Request, id: number) {
    try {
      // Get authenticated user
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      await ItemService.deleteItem(id, user.userId);

      return NextResponse.json(
        {
          success: true,
          message: 'Item deleted successfully',
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Delete item error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete item' },
        { status: error.message.includes('permission') ? 403 : 400 }
      );
    }
  }

  /**
   * GET /api/items/user/:userId
   * Get items by user ID
   */
  static async getUserItems(userId: number, page?: number, limit?: number) {
    try {
      const items = await ItemService.getUserItems(userId, page, limit);

      return NextResponse.json(
        {
          success: true,
          items,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get user items error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch items' },
        { status: 500 }
      );
    }
  }
}

export default ItemController;
