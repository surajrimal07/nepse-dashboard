// import z from "@nepse-dashboard/zod";
// import { ports } from "@/entrypoints/background";
// import {
// 	messageHandlers,
// 	messageSchemas,
// 	oddLotHandlers,
// } from "@/lib/handlers/event-schema";
// import { broadcastToPorts } from "@/lib/handlers/send-port";
// import { pendingRequests } from "@/lib/service/app-service";
// import { rateLimitState } from "@/state/rate-limit-state";
// import { EventName } from "@/types/analytics-types";
// import type { ValidationErrorType } from "@/types/error-types";
// import type { SocketMessage } from "@/types/port-types";
// import { OpenPanelSDK } from "@/utils/open-panel-sdk";

// /**
//  * Validates incoming message against its schema
//  * @param message - The incoming socket message
//  * @returns ValidationErrorType if validation fails, null if passes
//  */
// function validateMessageSchema(
// 	message: SocketMessage,
// ): ValidationErrorType | null {
// 	const schema = messageSchemas[message.event as keyof typeof messageSchemas];

// 	if (!schema) {
// 		if (message.event) {
// 			console.warn("Schema not found for event:", message.event);
// 			OpenPanelSDK.track(EventName.SCHEMA_NOT_FOUND, {
// 				eventName: message.event,
// 				name: "Schema not found in validateMessageSchema",
// 			});
// 		}
// 		return null; // No schema means no validation error
// 	}

// 	try {
// 		schema.parse(message.data);
// 		return null; // Validation passed
// 	} catch (error) {
// 		if (error instanceof z.ZodError) {
// 			OpenPanelSDK.track(EventName.SCHEMA_EXCEPTION, {
// 				error: JSON.stringify(error.issues),
// 				name: "Schema validation failed in validateMessageSchema",
// 			});

// 			return {
// 				type: "VALIDATION_ERROR",
// 				error: {
// 					message: `Schema validation failed for event ${message.event}`,
// 					originalError: message.data?.error || message.data?.message || null,
// 					details: error.issues,
// 				},
// 			};
// 		}

// 		// Non-ZodError case
// 		OpenPanelSDK.track(EventName.SCHEMA_EXCEPTION, {
// 			error: String(error),
// 			name: "Non-Zod error in validateMessageSchema",
// 		});

// 		return {
// 			type: "VALIDATION_ERROR",
// 			error: {
// 				message: `Unexpected validation error for event ${message.event}`,
// 				originalError: String(error),
// 			},
// 		};
// 	}
// }

// /**
//  * Handles messages that are responses to pending requests
//  * @param message - The incoming socket message
//  * @param validationError - Validation error if any
//  * @returns true if message was handled as pending request, false otherwise
//  */
// function handlePendingRequest(
// 	message: SocketMessage,
// 	validationError: ValidationErrorType | null,
// ): boolean {
// 	if (!message.requestId || !pendingRequests.has(message.requestId)) {
// 		return false;
// 	}

// 	const pending = pendingRequests.get(message.requestId)!;
// 	clearTimeout(pending.timeoutId);

// 	try {
// 		if (validationError) {
// 			const errMsg = `${validationError.error.message}. Details: ${JSON.stringify(validationError.error.details || [])}`;
// 			pending.reject(new Error(errMsg));
// 		} else {
// 			const backendError = message.data?.error;
// 			if (backendError) {
// 				const errorMsg =
// 					typeof backendError === "string"
// 						? backendError
// 						: backendError.message ||
// 							"Request failed with an unspecified backend error.";
// 				pending.reject(new Error(errorMsg));
// 			} else {
// 				pending.resolve(message.data);
// 			}
// 		}
// 	} catch (error) {
// 		OpenPanelSDK.track(EventName.PORT_ERROR, {
// 			error: String(error),
// 			name: "Error in handlePendingRequest",
// 		});
// 		pending.reject(new Error("Failed to process pending request response"));
// 	} finally {
// 		pendingRequests.delete(message.requestId);
// 	}

// 	return true;
// }

// /**
//  * Routes message to appropriate destination (ports or state)
//  * @param message - The incoming socket message
//  */
// function routeMessage(message: SocketMessage): void {
// 	if (ports && ports.size > 0) {
// 		broadcastToPorts(message);
// 	} else {
// 		updateState(message);
// 	}
// }

// /**
//  * Broadcasts validation error to connected ports
//  * @param originalMessage - The original message that failed validation
//  * @param validationError - The validation error details
//  */
// function broadcastValidationError(
// 	originalMessage: SocketMessage,
// 	validationError: ValidationErrorType,
// ): void {
// 	const errorMessage: SocketMessage = {
// 		event: originalMessage.event,
// 		data: validationError.error,
// 		requestId: originalMessage.requestId,
// 	};

// 	if (ports && ports.size > 0) {
// 		broadcastToPorts(errorMessage);
// 	}
// }

// /**
//  * Main message broker function
//  * @param incomingMessage - The incoming socket message to process
//  */
// export function sendDataToPort(incomingMessage: SocketMessage): void {
// 	// Step 1: Validate message schema
// 	const validationError = validateMessageSchema(incomingMessage);

// 	// Step 2: Handle pending requests first (with or without validation errors)
// 	const wasHandledAsPendingRequest = handlePendingRequest(
// 		incomingMessage,
// 		validationError,
// 	);
// 	if (wasHandledAsPendingRequest) {
// 		return; // Message fully processed as pending request response
// 	}

// 	// Step 3: Handle validation errors for non-pending requests
// 	if (validationError) {
// 		broadcastValidationError(incomingMessage, validationError);
// 		return; // Don't process further if validation failed
// 	}

// 	// Step 4: Route valid message to appropriate destination
// 	routeMessage(incomingMessage);
// }

// function updateState(data: SocketMessage) {
// 	if (data.rateLimit) {
// 		rateLimitState.getState().setRateLimit(data.rateLimit);
// 	}

// 	const messageHandler =
// 		messageHandlers[data.event as keyof typeof messageHandlers];
// 	if (messageHandler) {
// 		try {
// 			messageHandler(data.data);
// 			return;
// 		} catch (error) {
// 			OpenPanelSDK.track(EventName.PORT_ERROR, {
// 				error:
// 					error instanceof z.ZodError
// 						? JSON.stringify(error.issues)
// 						: String(error),
// 				name: "Error in messageHandler",
// 			});
// 		}
// 	}

// 	if (data.event === "oddLot" && data.data?.type) {
// 		const oddLotHandler =
// 			oddLotHandlers[data.data.type as keyof typeof oddLotHandlers];
// 		if (oddLotHandler) {
// 			try {
// 				oddLotHandler(data.data.data);
// 			} catch (error) {
// 				OpenPanelSDK.track(EventName.PORT_ERROR, {
// 					error:
// 						error instanceof z.ZodError
// 							? JSON.stringify(error.issues)
// 							: String(error),
// 					name: "Error in oddLotHandler",
// 				});
// 			}
// 		}
// 	}
// }
