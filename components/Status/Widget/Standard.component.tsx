import Image from 'next/image';
import { Fragment } from 'react';
import { Icon } from '@iconify/react';

import { Error, Loading } from '~/components/Status';
import { Status } from '~/components';
import { useStatus } from '~/lib';

import { ReactNode } from 'react';

type Avatar =
	| {
		icon: boolean;
	}
	| {
		alt: string;
		href?: string;
		url: string;
	};

interface Activity {
	avatar: Avatar;
	title: string;
	description: string | Array<string>;
	icon?: string | ReactNode;
}

export function Widget() {
	const { loading, status } = useStatus();

	if (loading) return <Loading />;

	if (!status || Object.keys(status).length === 0 || !status) return <Error />;

	let custom = status.activities.filter((activity) => activity.id == 'custom')?.at(0);

	const activities: Array<Activity> = [
		/**
		 * Discord User
		 */
		{
			avatar: {
				alt: 'Discord Avatar',
				url: `https://cdn.discordapp.com/avatars/${status.discord_user.id}/${status.discord_user.avatar}`,
			},
			title: status.discord_user.global_name,
			description: custom?.state,
			icon: <Status.Indicator status={status.discord_status} />,
		},

		/**
		 * Spotify
		 */
		...(status.spotify && status.listening_to_spotify
			? [
				{
					avatar: {
						alt: `${status.spotify.song} - ${status.spotify.artist}`,
						href: `https://open.spotify.com/track/${status.spotify.track_id}`,
						url: status.spotify.album_art_url,
					},
					title: status.spotify.song,
					description: status.spotify.artist,
					icon: 'feather:music',
				},
			]
			: []),

		/**
		 * All other activities
		 */
		...(status.activities.length > 0
			? status.activities.map((activity) => {
				if (activity.id === 'custom' || activity.id.includes('spotify')) return null;

				const hasAsset = activity.assets && activity.assets.large_image ? true : false;
				const avatar = hasAsset
					? {
						alt: activity.details,
						url: (activity.assets.large_image.startsWith('mp:external/'))
							? `https://media.discordapp.net/${activity.assets.large_image.slice(3)}`
							: `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.webp`,
					}
					: {
						alt: activity.name,
						icon: true,
						url: '',
					};

				return {
					avatar,
					title: activity.name,
					description: [
						activity.details,
						...(activity.state ? [activity.state] : []),
					],
				};
			})
			: []),
	].filter((item) => item !== null);

	return (
		<div
			style={{
				background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
				WebkitBackdropFilter: 'blur(50px)',
				backdropFilter: 'blur(50px)',
				borderRadius: '50px',
				borderColor: 'rgba(66, 66, 66, 0.25)',
				borderWidth: '1.5px'
			}}
			className="flex flex-col space-y-5 w-full max-w-sm mx-auto px-6 py-6 shadow-xl"
		>
			{activities.map((activity, index) => {
				return (
					<Fragment key={index}>
						<div className="inline-flex items-center">
							{'icon' in activity.avatar ? (
								<div className="max-w-md max-h-12 my-auto rounded-[15px] pointer-events-none select-none ring-2 ring-gray-200 dark:ring-gray-500">
									<Icon
										className="w-12 h-12 p-1 text-gray-300"
										icon="lucide:gamepad-2"
									/>
								</div>
							) : activity.avatar.href ? (
								<a
									className="rounded-[15px] default-transition default-focus"
									href={activity.avatar.href}
									target="_blank"
									rel="noreferrer noopener"
								>
									<div className="max-w-md max-h-12 my-auto rounded-[15px] pointer-events-none select-none ring-2 ring-gray-200 dark:ring-gray-500">
										<Image
											alt={activity.avatar.alt}
											className="w-full max-h-12 rounded-[15px]"
											height={48}
											src={activity.avatar.url}
											width={48}
										/>
									</div>
								</a>
							) : (
								<div className="max-w-md max-h-12 my-auto rounded-[15px] pointer-events-none select-none ring-2 ring-gray-200 dark:ring-gray-500">
									<Image
										alt={activity.avatar.alt}
										className="w-full max-h-12 rounded-[15px]"
										height={48}
										src={activity.avatar.url}
										width={48}
										objectFit='cover'
									/>
								</div>
							)}

							<div className="flex-1 ml-4">
								{'icon' in activity.avatar && activity.avatar.icon ? (
									<>
										<p className="mt-0 mb-1 text-xs tracking-wide font-medium text-gray-300">
											Playing
										</p>
										<h1 className="text-base font-extrabold line-clamp-1 tracking-wide overflow-ellipsis text-white">
											{activity.title}
										</h1>
									</>
								) : Array.isArray(activity.description) ? (
									<>
										<h1 className="text-base font-extrabold line-clamp-1 tracking-wide overflow-ellipsis text-white">
											{activity.title}
										</h1>
										{activity.description.map(
											(description, descriptionIndex) => (
												<p
													className="mt-1 text-xs tracking-wide font-medium text-gray-300"
													key={descriptionIndex}
												>
													{description}
												</p>
											),
										)}
									</>
								) : (
									<>
										<h1 className="text-base font-extrabold line-clamp-1 tracking-wide overflow-ellipsis text-white">
											{activity.title} {index === 0 && (
												<span className="mt-1 text-sm tracking-wide font-medium text-gray-300">
													{`(${status.discord_user.username})`}
												</span>
											)}
										</h1>
										<p className="mt-1 text-xs tracking-wide font-medium text-gray-300">
											{index === 0 && custom && custom.emoji && (
												<img style={{ display: 'inline', marginRight: '4px' }} src={`https://cdn.discordapp.com/emojis/${custom.emoji.id}.${custom.emoji.animated ? 'gif' : 'png'}?size=20&quality=lossless`} />
											)}
											{activity.description}
										</p>
									</>
								)}
							</div>

							{activity.icon &&
								(typeof activity.icon === 'string' ? (
									<Icon
										className="w-6 h-6 mx-3 text-gray-300 motion-safe:animate-pulse"
										icon={activity.icon}
									/>
								) : (
									activity.icon
								))}
						</div>

						{index + 1 !== activities.length && (
							<hr className="h-0.5 bg-gray-400 bg-opacity-30 border-none rounded-full" />
						)}
					</Fragment>
				);
			})}
		</div>
	);
}
