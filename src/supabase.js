import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project details
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey)

// Function to update ticket registration status
export const updateTicketRegistration = async (ticketId) => {
  try {
    console.log('🔄 Updating ticket registration for ID:', ticketId);
    
    // First, let's check if the ticket exists and get its current state
    console.log('🔍 Checking ticket existence before update...');
    const { data: existingTicket, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (checkError) {
      console.error('❌ Error checking ticket existence:', checkError);
      throw new Error(`Ticket not found: ${checkError.message}`);
    }

    if (!existingTicket) {
      console.error('❌ Ticket not found in database');
      throw new Error('Ticket not found in database');
    }

    console.log('✅ Ticket exists, current reregistered status:', existingTicket.reregistered);

    // Now perform the update
    // Create a date in WIB timezone (UTC+7)
    const now = new Date();
    
    // Create WIB time by adding 7 hours to UTC
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const wibISOString = wibTime.toISOString();
    
    console.log('🕐 Current UTC time:', now.toISOString());
    console.log('🕐 WIB time (UTC+7):', wibISOString);
    console.log('🕐 Jakarta time readable:', now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        reregistered: true
      })
      .eq('ticket_id', ticketId)
      .select('*')

    if (error) {
      console.error('❌ Update error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error
    }

    if (!data || data.length === 0) {
      console.error('❌ No rows were updated - this might be due to RLS policies');
      console.error('Current ticket data:', existingTicket);
      throw new Error('No rows were updated - this might be due to Row Level Security policies blocking the update');
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating ticket registration:', error)
    return { data: null, error }
  }
}

// Function to get ticket details
export const getTicketDetails = async (ticketId) => {
  try {
    const { data, error } = await supabase
      .from('users') // Updated to use 'users' table
      .select('*')
      .eq('ticket_id', ticketId) // Updated to use 'ticket_id' column
      .single()

    if (error) {
      console.error('❌ Database query error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching ticket details:', error)
    return { data: null, error }
  }
}
