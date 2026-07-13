-- Script to assign all past users to the LB Nagar branch in Hyderabad

DO $$
DECLARE
    v_city_id UUID;
    v_branch_id UUID;
BEGIN
    -- 1. Get the ID for Hyderabad
    SELECT id INTO v_city_id FROM public.cities WHERE city_name = 'Hyderabad' LIMIT 1;
    
    -- 2. Get the ID for the LB Nagar branch
    SELECT id INTO v_branch_id FROM public.branches WHERE city_id = v_city_id AND name = 'LB Nagar' LIMIT 1;
    
    -- 3. Update all users (except the one recently created in Ameerpet)
    IF v_branch_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET 
            branch_id = v_branch_id, 
            city_name = 'Hyderabad'
        WHERE 
            name != 'Jhansi' OR name IS NULL;
            
        RAISE NOTICE 'Successfully moved past users to LB Nagar branch.';
    ELSE
        RAISE EXCEPTION 'LB Nagar branch not found. Please create it in the Branch Management screen first.';
    END IF;
END $$;
