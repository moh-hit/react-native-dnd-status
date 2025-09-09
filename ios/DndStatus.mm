#import "DndStatus.h"

@implementation DndStatus
RCT_EXPORT_MODULE()

- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);

    return result;
}

- (void)addListener:(NSString *)eventName {
    // iOS doesn't support DND status monitoring, so this is a no-op
}

- (void)removeListeners:(double)count {
    // iOS doesn't support DND status monitoring, so this is a no-op
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeDndStatusSpecJSI>(params);
}

@end
