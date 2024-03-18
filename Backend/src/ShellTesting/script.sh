#!/bin/bash

# Function to run executable_path with timeout and stream stdout line by line
run_with_timeout() {
    local executable_path="$1"
    local time_limit="$2"
    local output_file_path="$3"

    # Create the output file if it doesn't exist
    touch "$output_file_path"

    # Run the executable with timeout, redirecting stdout to output file
    timeout "$time_limit"s "$executable_path" >> "$output_file_path" 2>/dev/null

    # Check the exit code of the timeout command
    local timeout_exit_code=$?
    
    if [ $timeout_exit_code -eq 124 ]; then
        # Process was terminated by timeout
        echo "Process killed due to timeout."
        return 124
    elif [ $timeout_exit_code -eq 0 ]; then
        # Process ended successfully before timeout
        echo "Process completed within the time limit."
        return 0
    else
        # Other errors may have occurred
        echo "An error occurred while running the process."
        return 1
    fi
}

# Example usage: run_with_timeout <executable_path> <time_limit> <output_file_path>
run_with_timeout "./normalx" 5 "./output.txt"