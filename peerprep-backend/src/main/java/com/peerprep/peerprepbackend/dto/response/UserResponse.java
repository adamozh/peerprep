package com.peerprep.peerprepbackend.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserResponse {
    Long id;
    String username;
    String email;
    String country;
}
